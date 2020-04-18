import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from 'apollo-boost';
import gql from 'graphql-tag';
import { isLoggedIn, getAccessToken } from './auth';

const endpointURL = 'http://localhost:9000/graphql';
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        authorization: 'Bearer ' + getAccessToken(),
      },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: endpointURL })]),
  cache: new InMemoryCache(),
});

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      id
      title
      company {
        id
        name
      }
      description
    }
  }
`;

const companyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      id
      title
      company {
        id
        name
      }
      description
    }
  }
`;

const jobsQuery = gql`
  query JobsQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;

export const createJob = async (input) => {
  console.log(input);

  const {
    data: { job },
  } = await client.mutate({
    mutation: createJobMutation,
    variables: { input },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return job;
};

export const loadCompany = async (id) => {
  const {
    data: { company },
  } = await client.query({ query: companyQuery, variables: { id } });
  return company;
};

export const loadJob = async (id) => {
  const {
    data: { job },
  } = await client.query({ query: jobQuery, variables: { id } });

  return job;
};

export const loadJobs = async () => {
  const {
    data: { jobs },
  } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache' });

  return jobs;
};
