import React, { Component } from 'react';
import { loadCompany } from './requests';
import { JobList } from './JobList';

export class CompanyDetail extends Component {
  // const {companyId} = this.props.match.params;
  state = { company: {} };

  async componentDidMount() {
    const { companyId } = this.props.match.params;
    const company = await loadCompany(companyId);
    this.setState({ company });
  }

  render() {
    const { company } = this.state;
    console.log(company);
    if (!company) {
      return null;
    }
    console.log('here');
    return (
      <div>
        <h1 className='title'>{company.name}</h1>
        <div className='box'>{company.description}</div>
        <h5 className='title is-5'>Jobs at {company.name}</h5>
        <JobList jobs={company.jobs || []} />
      </div>
    );
  }
}
