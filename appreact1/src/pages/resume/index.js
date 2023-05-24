import React from "react";
import "./style.css";
import {Document, Page, pdfjs} from 'react-pdf';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { resume, meta } from "../../content_option";
pdfjs.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}pdf.worker.js'

export const Resume = () => {
  return (
    <HelmetProvider>
      <Container className="About-header">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Resume | {meta.title} </title>{" "}
          <meta name="description" content={meta.description} />
        </Helmet>
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">Resume </h1>{" "}
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>
        <div className="mb-5 po_items_ho">
          {resume.map((data, i) => {
            return (
              <div key={i} className="po_item">
                <img src={data.img} alt="" />
                <div className="content">
                  <p>{data.description}</p>
                  <a href={data.link}>Learn more</a>
                </div>
              </div> 
            );
          
          })}
        </div>
        <div className='res'>
            <h2 className='heading'>Resume</h2>
                <Document
                    file = {"https://pdfhost.io/v/MXdxJpBPj_wadwadadf43948e2hffjw"}
                    onLoadError={console.error}
                    style={{width: '100vw', height: auto}}
                >
                    <Page pageIndex={0}/>
                </Document>

        </div>
      </Container>
    </HelmetProvider>
  );
};
